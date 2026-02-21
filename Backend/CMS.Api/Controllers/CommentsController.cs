using System;
using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly ILogger<CommentsController> _logger;
        private readonly ICommentsService _commentsService;

        public CommentsController(ILogger<CommentsController> logger, ICommentsService commentsService)
        {
            _logger = logger;
            _commentsService = commentsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllComments([FromQuery] PaginationRequest? paginationRequest, [FromQuery] Guid? contributionId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                if (contributionId.HasValue && contributionId.Value == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                paginationRequest ??= new PaginationRequest();

                var comments = await _commentsService.GetAllCommentsAsync(paginationRequest, contributionId);
                return comments.ToApiResponse(ApiResponseMessages.Retrieved("Comments"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("comments"), 500);
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCommentById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Comment"), 400);
                }

                var comment = await _commentsService.GetCommentByIdAsync(id);
                if (comment == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Comment"), 404);
                }

                return comment.ToApiResponse(ApiResponseMessages.Retrieved("Comment"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comment {CommentId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("comment"), 500);
            }
        }

        [HttpGet("contribution/{contributionId:guid}")]
        public async Task<IActionResult> GetCommentsByContributionId(Guid contributionId)
        {
            try
            {
                if (contributionId == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var comments = await _commentsService.GetCommentsByContributionIdAsync(contributionId);
                return comments.ToApiResponse(ApiResponseMessages.Retrieved("Comments"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving comments for contribution {ContributionId}", contributionId);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("comments"), 500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment(CommentCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createdComment = await _commentsService.CreateCommentAsync(request);
                return createdComment.ToApiResponse(ApiResponseMessages.Created("Comment"), 201);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Comment validation failed while creating comment");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating comment");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating comment");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("comment"), 500);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateComment(Guid id, CommentUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Comment"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedComment = await _commentsService.UpdateCommentAsync(id, request);
                if (updatedComment == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Comment"), 404);
                }

                return updatedComment.ToApiResponse(ApiResponseMessages.Updated("Comment"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Comment validation failed while updating comment {CommentId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating comment {CommentId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("comment"), 500);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Comment"), 400);
                }

                var deleted = await _commentsService.DeleteCommentAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Comment"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("Comment"));
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting comment {CommentId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("comment"), 500);
            }
        }
    }
}
